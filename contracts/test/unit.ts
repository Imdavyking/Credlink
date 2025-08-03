import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import hre from "hardhat"
import { ethers, network } from "hardhat"
import dotenv from "dotenv"
import { localHardhat } from "../utils/localhardhat.chainid"

dotenv.config()

const chainId = network.config.chainId

typeof chainId !== "undefined" && !localHardhat.includes(chainId)
    ? describe.skip
    : describe("CredlinkDeployer", function () {
          async function deployCredlinkFixture() {
              const [owner, otherAccount] = await hre.ethers.getSigners()

              const credDeployer = await hre.ethers.getContractFactory("Credlink")

              const credLinkDeployer = await credDeployer.deploy()

              await credLinkDeployer.waitForDeployment()

              const credLinkAddress = await credLinkDeployer.getAddress()
              return {
                  credLinkDeployer,
                  credLinkAddress,
                  owner,
                  otherAccount,
              }
          }

          describe("Deployment", function () {
              it("Should set owner on deployer", async function () {
                  const { credLinkDeployer, owner, otherAccount } = await loadFixture(
                      deployCredlinkFixture
                  )
                  const deployerOwner = await credLinkDeployer.owner()
                  expect(deployerOwner).to.equal(owner.address)
              })
          })

          describe("createLoan", function () {
              it("Should create a loan", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 86400
                  const tx = await credLinkDeployer.createLoan(
                      ethers.ZeroAddress,
                      value,
                      duration,
                      {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      }
                  )
                  await tx.wait()
                  expect(tx).to.emit(credLinkDeployer, "LoanCreated")
              })
          })

          describe("can withdraw liquidity if not borrowed", function () {
              it("Should allow owner to withdraw liquidity if not borrowed", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 86400
                  const tx = await credLinkDeployer.createLoan(
                      ethers.ZeroAddress,
                      value,
                      duration,
                      {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      }
                  )
                  await tx.wait()
                  const withdrawTx = await credLinkDeployer.withdrawLiquidity(
                      ethers.ZeroAddress,
                      value, // Withdraw more than created loan amount
                      {
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      }
                  )
                  await withdrawTx.wait()
                  expect(withdrawTx).to.emit(credLinkDeployer, "LiquidityWithdrawn")
              })
          })

          describe("createLoan with zero amount", function () {
              it("Should fail to create a loan with zero amount", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("0.0")
                  const duration = 86400
                  await expect(
                      credLinkDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      })
                  ).to.be.revertedWithCustomError(credLinkDeployer, "Credlink__ZeroAmount")
              })
          })

          describe("createLoan with zero duration", function () {
              it("Should fail to create a loan with zero duration", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 0
                  await expect(
                      credLinkDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      })
                  ).to.be.revertedWithCustomError(credLinkDeployer, "Credlink__ZeroDuration")
              })
          })

          describe("lockCollateral", function () {
              it("Should lock collateral", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("1.0")
                  const tx = await credLinkDeployer.lockCollateral(ethers.ZeroAddress, value, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  await tx.wait()
                  expect(tx).to.emit(credLinkDeployer, "CollateralLocked")
              })
          })

          describe("lockCollateral with zero amount", function () {
              it("Should fail to lock collateral with zero amount", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("0.0")
                  await expect(
                      credLinkDeployer.lockCollateral(ethers.ZeroAddress, value, {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      })
                  ).to.be.revertedWithCustomError(credLinkDeployer, "Credlink__ZeroAmount")
              })
          })

          describe("acceptLoan", function () {
              it("Should accept a loan", async function () {
                  const { credLinkDeployer, owner } = await loadFixture(deployCredlinkFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 86400
                  await credLinkDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  await credLinkDeployer.lockCollateral(ethers.ZeroAddress, value, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  const tx = await credLinkDeployer.acceptLoan(
                      owner.address,
                      ethers.ZeroAddress,
                      1
                  )
                  await tx.wait()
                  expect(tx).to.emit(credLinkDeployer, "LoanAccepted")
              })
          })
      })
