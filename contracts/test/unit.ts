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
    : describe("UmixDeployer", function () {
          // We define a fixture to reuse the same setup in every test.
          // We use loadFixture to run this setup once, snapshot that state,
          // and reset Hardhat Network to that snapshot in every test.
          async function deployUmixFixture() {
              // Contracts are deployed using the first signer/account by default
              const [owner, otherAccount] = await hre.ethers.getSigners()

              const UmixDeployer = await hre.ethers.getContractFactory("Umix")

              const umixDeployer = await UmixDeployer.deploy()

              await umixDeployer.waitForDeployment()

              const umixAddress = await umixDeployer.getAddress()
              return {
                  umixDeployer,
                  umixAddress,
                  owner,
                  otherAccount,
              }
          }

          describe("Deployment", function () {
              it("Should set owner on deployer", async function () {
                  const { umixDeployer, owner, otherAccount } = await loadFixture(
                      deployUmixFixture
                  )
                  const deployerOwner = await umixDeployer.owner()
                  expect(deployerOwner).to.equal(owner.address)
              })
          })

          describe("createLoan", function () {
              it("Should create a loan", async function () {
                  const { umixDeployer, owner } = await loadFixture(deployUmixFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 86400
                  const tx = await umixDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  await tx.wait()
                  expect(tx).to.emit(umixDeployer, "LoanCreated")
              })
          })

          describe("createLoan with zero amount", function () {
              it("Should fail to create a loan with zero amount", async function () {
                  const { umixDeployer, owner } = await loadFixture(deployUmixFixture)
                  const value = ethers.parseEther("0.0")
                  const duration = 86400
                  await expect(
                      umixDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      })
                  ).to.be.revertedWithCustomError(umixDeployer, "Umix__ZeroAmount")
              })
          })

          describe("createLoan with zero duration", function () {
              it("Should fail to create a loan with zero duration", async function () {
                  const { umixDeployer, owner } = await loadFixture(deployUmixFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 0
                  await expect(
                      umixDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      })
                  ).to.be.revertedWithCustomError(umixDeployer, "Umix__ZeroDuration")
              })
          })

          describe("lockCollateral", function () {
              it("Should lock collateral", async function () {
                  const { umixDeployer, owner } = await loadFixture(deployUmixFixture)
                  const value = ethers.parseEther("1.0")
                  const tx = await umixDeployer.lockCollateral(ethers.ZeroAddress, value, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  await tx.wait()
                  expect(tx).to.emit(umixDeployer, "CollateralLocked")
              })
          })

          describe("lockCollateral with zero amount", function () {
              it("Should fail to lock collateral with zero amount", async function () {
                  const { umixDeployer, owner } = await loadFixture(deployUmixFixture)
                  const value = ethers.parseEther("0.0")
                  await expect(
                      umixDeployer.lockCollateral(ethers.ZeroAddress, value, {
                          value: value,
                          gasLimit: 5000000,
                          gasPrice: ethers.parseUnits("10", "gwei"),
                          from: owner.address,
                      })
                  ).to.be.revertedWithCustomError(umixDeployer, "Umix__ZeroAmount")
              })
          })

          describe("acceptLoan", function () {
              it("Should accept a loan", async function () {
                  const { umixDeployer, owner } = await loadFixture(deployUmixFixture)
                  const value = ethers.parseEther("1.0")
                  const duration = 86400
                  await umixDeployer.createLoan(ethers.ZeroAddress, value, duration, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  await umixDeployer.lockCollateral(ethers.ZeroAddress, value, {
                      value: value,
                      gasLimit: 5000000,
                      gasPrice: ethers.parseUnits("10", "gwei"),
                      from: owner.address,
                  })
                  const tx = await umixDeployer.acceptLoan(owner.address, ethers.ZeroAddress, 1)
                  await tx.wait()
                  expect(tx).to.emit(umixDeployer, "LoanAccepted")
              })
          })
      })
